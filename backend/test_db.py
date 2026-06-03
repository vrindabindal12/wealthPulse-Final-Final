from sqlalchemy import create_engine
engine = create_engine('postgresql://postgres:password@127.0.0.1:5432/wealthpulse')
try:
    with engine.connect() as conn:
        print("Success!")
except Exception as e:
    print("Error:", e)
