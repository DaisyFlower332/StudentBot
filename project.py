from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()
SUPABASE_URL= os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
print(SUPABASE_URL)
print(SUPABASE_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if o.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    query: str

SYSTEM_PROMPT = """
You are a friendly AI tutor for students aged 8 to 16.

Your responsibilities:

1. Explain homework and concepts in a simple, clear way
2. Use short sentences and easy words
3. Be supportive and encouraging
4. Stay calm and polite at all times

Behavior rules:

1. Never insult, shame, or judge the student
2. If the student is rude or inappropriate:
  Respond calmly and guide them toward respectful behavior
  Example: "Let's keep things respectful. I am here to help you learn."

Strict formatting rules:

1. Use plain text only
2. Do not use emojis
3. Do not use markdown formatting (no *, **, #, _, or backticks)
4. Do not include escape characters like \n in your response
5. Do not use bullet points or special symbols
6. Write in normal sentences and paragraphs only

Style rules:

1. Keep answers short and clear
2. Use examples when helpful
3. Sound like a kind and patient teacher

Always focus on helping the student understand and improve.
"""

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    password: str

class LogIn(BaseModel):
    email: EmailStr
    password: str

@app.post("/sign_up")
def sign_up(user:UserProfile):
    response = supabase.auth.sign_up({
        "email": user.email,
        "password": user.password
    })

    if response.user is None:
        raise HTTPException(status_code=400, detail="sign up failed")

    supabase.table("userprofile").insert({
        "id": response.user.id,
        "username": user.username,
        "email": user.email
    }).execute()

    return {"message": "sign up successful"}
    
@app.post("/log_in")
def log_in(user: LogIn):
    response = supabase.auth.sign_in_with_password({
        "email": user.email,
        "password": user.password
    })

    if response.user is None:
        raise HTTPException(status_code=400, detail="Login failed")

    # Update last_login timestamp
    supabase.table("userprofile").update({
        "last_login": "now()"
    }).eq("id", str(response.user.id)).execute()

    return {
        "message": "Login successful",
        "user_id": str(response.user.id),
        "access_token": response.session.access_token
    }

@app.get("/userprofile")
def get_accounts():
    result = supabase.table("userprofile").select("*").execute()
    return result.data

@app.get("/userprofile/{user_id}")
def find_account(user_id:str):
    result = supabase.table("userprofile").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code = 404, detail = "user not found")
    return result.data[0]

@app.put("/userprofile/{user_id}")
def update_account(user_id:str, userprofile:UserProfile):
    result = supabase.table("userprofile").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code = 404, detail = "user not found")
    existing = supabase.table("userprofile").select("*").eq("email", userprofile.email).execute()
    if existing.data and existing.data[0]["id"] != user_id:
        raise HTTPException(status_code = 400, detail = "email already exists")
    updated = supabase.table("userprofile").update(userprofile.dict(exclude_unset = True, exclude={"password"})).eq("id", user_id).execute()
    return updated.data[0]

@app.delete("/userprofile/{user_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_account(user_id:str):
    existing = supabase.table("userprofile").select("*").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code = 404, detail = "user not found")
    supabase.table("userprofile").delete().eq("id", user_id).execute()
    return

chat_memory = {}
def get_user_history(user_id):
    if user_id not in chat_memory:
        chat_memory[user_id] = []
    return chat_memory[user_id]

@app.post("/chat")
async def chat(req:ChatRequest):
    try:
        history = get_user_history(req.user_id)
        history.append({
            "role": "user",
            "content": req.query
        })
        trimmed_history = history[-10:]
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            temperature=0.7,
            system=SYSTEM_PROMPT,
            messages=trimmed_history
        )
        reply = response.content[0].text
        print(reply)
        #Save assistant reply
        history.append({
            "role":"assistant",
            "content":reply
        })
        return {
            "user_id":req.user_id,
            "response":reply
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chats")
def get_chats():
    result = supabase.table("conversation").select("*").execute()
    return result.data
    
@app.get("/chat/{user_id}")
def find_chat(user_id):
    result = supabase.table("conversation").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code = 404, detail = "user not found")
    return result.data[0]
