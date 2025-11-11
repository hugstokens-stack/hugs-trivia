from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/question")
def question():
    level = int(request.args.get("level", 1))
    questions = {
        1: ("What color is the sky?", "blue"),
        2: ("How many days are in a week?", "7"),
        3: ("Capital of France?", "Paris"),
        4: ("Who painted the Mona Lisa?", "Leonardo da Vinci"),
        5: ("Fastest land animal?", "cheetah"),
    }
    q, a = questions.get(level, questions[1])
    return jsonify({"level": level, "question": q, "answer": a})
