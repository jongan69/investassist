import json

def add_asset_type(json_file):
    with open(json_file, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    for obj in data:
        obj["assetType"] = "stocks"
    
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)

if __name__ == "__main__":
    json_file = "tickers.json"  # Change this to your actual JSON file name
    add_asset_type(json_file)
    print("Updated JSON file successfully!")
