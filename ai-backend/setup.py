#!/usr/bin/env python3
"""
Setup script for Pepmart AI Backend
This script sets up the Python environment and downloads the required models
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major != 3 or version.minor < 8:
        print(f"❌ Python 3.8+ required, but found Python {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_gpu():
    """Check for GPU availability"""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ CUDA GPU detected: {gpu_name}")
            return "cuda"
        elif torch.backends.mps.is_available():
            print("✅ Apple Metal Performance Shaders (MPS) detected")
            return "mps"
        else:
            print("⚠️  No GPU detected, will use CPU (slower)")
            return "cpu"
    except ImportError:
        print("⚠️  PyTorch not installed yet, GPU check will happen after installation")
        return "unknown"

def setup_environment():
    """Set up the Python environment"""
    print("🚀 Setting up Pepmart AI Backend Environment")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create virtual environment
    venv_path = Path("venv")
    if not venv_path.exists():
        if not run_command("python3 -m venv venv", "Creating virtual environment"):
            sys.exit(1)
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation command based on OS
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/macOS
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Upgrade pip
    run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip")
    
    # Install requirements
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing Python packages"):
        print("❌ Failed to install requirements. Trying individual packages...")
        
        # Core packages
        essential_packages = [
            "fastapi==0.104.1",
            "uvicorn[standard]==0.24.0",
            "torch torchvision --index-url https://download.pytorch.org/whl/cu118",
            "diffusers==0.25.0",
            "transformers==4.36.2",
            "accelerate==0.25.0",
            "pillow==10.1.0",
            "opencv-python==4.8.1.78",
            "controlnet-aux==0.4.0"
        ]
        
        for package in essential_packages:
            run_command(f"{pip_cmd} install {package}", f"Installing {package.split('==')[0]}")
    
    # Check GPU after installation
    check_gpu()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("\nNext steps:")
    print(f"1. Activate virtual environment: {activate_cmd}")
    print("2. Start the AI backend: python main.py")
    print("3. The API will be available at http://localhost:8000")
    print("\n💡 On first run, models will be downloaded automatically (~4GB)")

if __name__ == "__main__":
    setup_environment()