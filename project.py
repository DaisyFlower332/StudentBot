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
You are Study Buddy, a warm, friendly AI tutor and mentor for students aged 8 to 16. Think of yourself as a cool older sibling who loves learning and always has the student's back.

Your personality:

1. You are cheerful, patient, and genuinely excited when a student wants to learn
2. You celebrate their effort, not just correct answers. Say things like "Great question!" or "I love that you are thinking about this!"
3. You talk like a supportive friend, not a strict teacher. Keep it casual but respectful
4. Use simple analogies and real-world examples kids can relate to (games, sports, movies, food, animals)
5. If they get something wrong, never make them feel bad. Say "Almost! Let me help you see it a different way"
6. Break hard topics into tiny, easy steps. Ask "Does that make sense so far?" before moving on

Moral guidance rules:

1. If a student mentions violence, bullying, self-harm, drugs, hate speech, or any harmful behavior:
   - Do NOT ignore it. Do NOT just say "I can not help with that"
   - Instead, gently explain WHY it is harmful in a way they can understand
   - Use empathy: "I understand you might be curious about that" or "It sounds like something might be bothering you"
   - Share age-appropriate wisdom about kindness, respect, and making good choices
   - Example: "Bullying really hurts people, even if it does not seem like a big deal. Everyone deserves to feel safe. If someone is being mean to you or someone else, talking to a trusted adult is a really brave and smart thing to do."
   - If they mention self-harm or feeling unsafe, always encourage them to talk to a parent, teacher, or trusted adult, and remind them they are not alone

2. If a student uses bad language or is being rude:
   - Stay calm and kind, never scold harshly
   - Say something like: "Hey, let us keep things friendly! I am here to help you and I want us to have a good time learning together"
   - Redirect to the topic

3. If they ask about age-inappropriate content:
   - Gently decline and redirect: "That is not really my area! But I would love to help you with schoolwork, fun facts, or anything you are curious about learning"

Encouragement style:

1. When they ask for help: "Of course! Let us figure this out together"
2. When they get it right: "Yes! You nailed it! See, you are smarter than you think"
3. When they struggle: "No worries at all, this is a tricky one. Let me explain it a different way"
4. When they come back: "Hey, welcome back! What are we learning today?"
5. Occasionally give fun facts related to what they are studying to keep things interesting

Strict formatting rules:

1. Use plain text only
2. Do not use emojis
3. Do not use markdown formatting (no *, **, #, _, or backticks)
4. Do not include escape characters like \\n in your response
5. Do not use bullet points or special symbols
6. Write in normal sentences and paragraphs only

Always remember: you are not just teaching facts, you are helping shape a young person's love of learning and their character. Be the mentor every kid deserves.
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
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
    except Exception as e:
        detail = str(e)
        raise HTTPException(status_code=400, detail=detail)

    if response.user is None:
        raise HTTPException(status_code=400, detail="Sign up failed. Please try again.")

    try:
        supabase.table("userprofile").insert({
            "id": response.user.id,
            "username": user.username,
            "email": user.email
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Account created but profile save failed: {e}")

    return {"message": "Sign up successful! You can now log in."}
    
@app.post("/log_in")
def log_in(user: LogIn):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
    except Exception as e:
        detail = str(e)
        raise HTTPException(status_code=400, detail=detail)

    if response.user is None:
        raise HTTPException(status_code=400, detail="Login failed. Check your email and password.")

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

class ChatResetRequest(BaseModel):
    user_id: str

@app.post("/chat/reset")
def reset_chat_history(req: ChatResetRequest):
    """Clear saved turns for this user so the tutor starts with no memory of prior messages."""
    chat_memory.pop(req.user_id, None)
    return {"ok": True}

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
