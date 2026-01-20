"""
Quick start script for the Aadhaar Complete Backend
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Aadhaar Complete Backend API...")
    print("📊 Loading 32 core metrics + 9 ML trend analysis endpoints...")
    print("🌐 Server will be available at: http://127.0.0.1:8001")
    print("📖 API Documentation: http://127.0.0.1:8001/docs")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8001,
        reload=True
    )
