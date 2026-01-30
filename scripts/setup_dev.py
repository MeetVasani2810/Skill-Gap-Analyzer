import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    print(f"[*] {description}...")
    try:
        subprocess.check_call(command, shell=True)
        print(f" [v] {description} successful.")
        return True
    except subprocess.CalledProcessError as e:
        print(f" [!] Error: {description} failed: {e}")
        return False

def setup_venv():
    if not Path("venv").exists():
        return run_command(f"{sys.executable} -m venv venv", "Creating virtual environment")
    print("[*] Virtual environment already exists.")
    return True

def install_dependencies():
    pip_path = str(Path("venv/Scripts/pip.exe") if os.name == "nt" else Path("venv/bin/pip"))
    return run_command(f"{pip_path} install -r requirements.txt", "Installing dependencies")

def download_spacy_model():
    python_path = str(Path("venv/Scripts/python.exe") if os.name == "nt" else Path("venv/bin/python"))
    return run_command(f"{python_path} -m spacy download en_core_web_sm", "Downloading SpaCy model (en_core_web_sm)")

def check_env_file():
    print("[*] Checking .env file...")
    if not Path(".env").exists():
        if Path(".env.example").exists():
            import shutil
            shutil.copy(".env.example", ".env")
            print(" [v] Created .env from .env.example. PLEASE ADD YOUR GROQ_API_KEY!")
        else:
            print(" [!] Error: .env.example not found. Cannot create .env.")
            return False
    else:
        with open(".env", "r") as f:
            content = f.read()
            if "GROQ_API_KEY=" in content and "your_groq_api_key_here" in content or not content.strip():
                 print(" [!] Warning: GROQ_API_KEY is not set in .env. AI features will be disabled.")
            else:
                 print(" [v] .env file found and appears to be configured.")
    return True

def init_qdrant():
    # Check if remote Qdrant is configured in .env
    from dotenv import load_dotenv
    load_dotenv()
    if os.getenv("QDRANT_URL"):
        print("[*] Remote Qdrant cluster detected. Skipping local storage initialization.")
        return True
    
    print("[*] Ensuring local qdrant_data directory exists...")
    Path("qdrant_data").mkdir(exist_ok=True)
    print(" [v] qdrant_data directory ready.")
    return True

if __name__ == "__main__":
    print("=== Skill Gap Analyzer - Developer Setup ===\n")
    
    steps = [
        (setup_venv, "Virtual Environment Setup"),
        (install_dependencies, "Dependency Installation"),
        (download_spacy_model, "SpaCy Model Download"),
        (check_env_file, "Environment Configuration"),
        (init_qdrant, "Qdrant Storage Initialization")
    ]
    
    success = True
    for step_func, desc in steps:
        if not step_func():
            print(f"\n [!] Setup failed at step: {desc}")
            success = False
            break
    
    if success:
        print("\n=== Setup Complete Successfully! ===")
        print("You can now run the app using .\run.ps1 (Windows) or ./run.sh (Linux/bash)")
    else:
        print("\n=== Setup Failed. Please check the errors above. ===")
