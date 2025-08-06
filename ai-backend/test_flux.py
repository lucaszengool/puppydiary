#!/usr/bin/env python3
"""
Quick test script for FLUX.1-Kontext CLI
"""
import sys
import subprocess
from pathlib import Path

# Set up paths
FLUX_PATH = Path(__file__).parent.parent / "flux"
sys.path.insert(0, str(FLUX_PATH / "src"))

def test_flux_cli():
    """Test FLUX CLI directly"""
    
    # Test basic help first
    print("🧪 Testing FLUX CLI help...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "flux", "--help"
        ], cwd=FLUX_PATH, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ FLUX CLI help works")
        else:
            print(f"❌ FLUX CLI help failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ FLUX CLI help error: {e}")
        return False
    
    # Test kontext help
    print("🧪 Testing FLUX Kontext help...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "flux", "kontext", "--help"
        ], cwd=FLUX_PATH, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ FLUX Kontext help works")
        else:
            print(f"❌ FLUX Kontext help failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ FLUX Kontext help error: {e}")
        return False
    
    # Test actual generation (this will download models)
    print("🧪 Testing FLUX Kontext generation (this will take a few minutes)...")
    cup_path = FLUX_PATH / "assets" / "cup.png"
    if not cup_path.exists():
        print(f"❌ Test image not found: {cup_path}")
        return False
    
    try:
        cmd = [
            sys.executable, "-m", "flux", "kontext",
            "--prompt", "same cup, same pose, just in anime style",
            "--img_cond_path", str(cup_path),
            "--guidance", "2.5",
            "--num_steps", "4",  # Minimal steps for test
            "--device", "mps",
            "--output_dir", "test_output"
        ]
        
        print(f"Running: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd, 
            cwd=FLUX_PATH,
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes
        )
        
        print(f"Return code: {result.returncode}")
        if result.stdout:
            print(f"Stdout: {result.stdout}")
        if result.stderr:
            print(f"Stderr: {result.stderr}")
            
        if result.returncode == 0:
            print("✅ FLUX generation test completed")
            return True
        else:
            print("❌ FLUX generation test failed")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ FLUX generation timed out")
        return False
    except Exception as e:
        print(f"❌ FLUX generation error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing FLUX.1-Kontext setup...")
    
    # Change to FLUX directory and activate environment
    import os
    env = os.environ.copy()
    env['PYTHONPATH'] = str(FLUX_PATH / "src")
    
    success = test_flux_cli()
    
    if success:
        print("🎉 FLUX.1-Kontext is working correctly!")
    else:
        print("💥 FLUX.1-Kontext test failed")
        sys.exit(1)