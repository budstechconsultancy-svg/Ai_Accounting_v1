import requests

try:
    r = requests.get('http://localhost:8000/api/hierarchy/')
    print(f'Status: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        print(f'Count: {len(data)}')
        if len(data) > 0:
            print(f'First item: {data[0]}')
    else:
        print(f'Error: {r.text[:200]}')
except Exception as e:
    print(f'Exception: {e}')
