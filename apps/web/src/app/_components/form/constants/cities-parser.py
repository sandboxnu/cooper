import pandas as pd
import os
import json

def parse_cities_from_csv(file_path):
    file = pd.read_csv(file_path)
    file = file.rename(columns={'admin_name': 'state'})
    cities = file[['city','state', 'country' ]]

    cities_list = cities.to_dict(orient='records')
    return cities_list

def create_prefix_files(cities_data):
    prefixed_data = {}
    for city in cities_data:
        city_name = city['city']
        if len(city_name) >= 2:
            prefix = city_name[:2].lower()
            if prefix not in prefixed_data:
                prefixed_data[prefix] = []
            prefixed_data[prefix].append(city)
    return prefixed_data

def write_to_files(prefixed_data):
    os.makedirs(output_dir, exist_ok=True)
    for prefix, cities in prefixed_data.items():
        file_path = os.path.join(output_dir, f"{prefix}.ts")
        with open(file_path, 'w') as file:
            file.write(f"export const {prefix}Cities = ")
            json.dump(cities, file, indent=2)

def generate_index_file(output_dir):
    index_file_path = os.path.join(output_dir, 'index.ts')
    export_statements = []
    for file_name in os.listdir(output_dir):
        if file_name != 'index.ts' and file_name.endswith('.ts'):
            prefix = os.path.splitext(file_name)[0]
            export_statements.append(f'export {{ default as {prefix}Cities }} from "./{prefix}";')
    
    with open(index_file_path, 'w') as index_file:
        index_file.write('\n'.join(export_statements))


file_path = 'apps/web/src/app/_components/form/constants/worldcities.csv'
output_dir = 'apps/web/src/app/_components/form/constants/cities'
cities_data = parse_cities_from_csv(file_path)
prefixed_data = create_prefix_files(cities_data)
write_to_files(prefixed_data)
generate_index_file(output_dir)