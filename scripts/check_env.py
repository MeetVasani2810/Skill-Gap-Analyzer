import os
import sys
import socket
import importlib.util
from pathlib import Path

def check_python_version():
    print(f"[*] Python Version: {sys.version.split()[0]}")
    if sys.version_info < (3, 9):
        print(" [!] Warning: Python 3.9+ is recommended.")
    else:
        print(" [v] Python version OK.")

def check_dependencies():
    required = [
        "fastapi", "uvicorn", "qdrant_client", 
        "sentence_transformers", "groq", "spacy", "pandas"
    ]
    print("\n[*] Checking dependencies...")
    missing = []
    for lib in required:
        if importlib.util.find_spec(lib) is None:
            missing.append(lib)
    
    if missing:
        print(f" [!] Missing: {', '.join(missing)}")
        print("     Please run: pip install -r requirements.txt")
    else:
        print(" [v] All core dependencies found.")

def check_env_vars():
    print("\n[*] Checking environment variables...")
    from dotenv import load_dotenv
    load_dotenv()
    
    key = os.getenv("GROQ_API_KEY")
    if not key:
        print(" [!] Warning: GROQ_API_KEY not found in .env")
        print("     AI features (Roadmap, RAG) will be disabled.")
    else:
        print(" [v] GROQ_API_KEY found.")

def check_data_files():
    print("\n[*] Checking data files...")
    data_path = Path("data/job_dataset.json")
    if not data_path.exists():
        print(f" [!] Warning: {data_path} not found.")
        print("     The app will fall back to AI generation for role skills.")
    else:
        print(f" [v] {data_path} found.")

def check_port(port=8000):
    print(f"\n[*] Checking port {port}...")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            print(f" [v] Port {port} is available.")
        except socket.error:
            print(f" [!] Error: Port {port} is ALREADY IN USE.")
            print("     Make sure no other instance of the backend is running.")

def check_spacy():
    print("\n[*] Checking SpaCy model...")
    try:
        import spacy
        if spacy.util.is_package("en_core_web_sm"):
            print(" [v] SpaCy model 'en_core_web_sm' found.")
        else:
            print(" [!] Missing SpaCy model 'en_core_web_sm'.")
            print("     Run: python -m spacy download en_core_web_sm")
    except ImportError:
        print(" [!] SpaCy not installed.")

def check_qdrant_storage():
    print("\n[*] Checking Qdrant storage...")
    if Path("qdrant_data").exists():
        print(" [v] Local qdrant_data directory found.")
    else:
        print(" [!] Warning: qdrant_data directory missing. It will be created on first run.")

if __name__ == "__main__":
    print("=== Skill Gap Analyzer Environment Check ===\n")
    check_python_version()
    check_dependencies()
    check_env_vars()
    check_data_files()
    check_spacy()
    check_qdrant_storage()
    check_port()
    print("\n=== Check Complete ===")
