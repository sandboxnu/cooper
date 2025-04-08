import csv
import uuid

# Input and output file paths
input_file = 'location.csv'
output_file = 'output_with_uuid.csv'

# Open the input file for reading and output file for writing
with open(input_file, mode='r', newline='', encoding='utf-8') as infile, \
     open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    # Append UUID to each row
    for row in reader:
        row_with_uuid = [str(uuid.uuid4())] + row
        writer.writerow(row_with_uuid)

print(f"UUIDs added to each row. Output written to {output_file}")