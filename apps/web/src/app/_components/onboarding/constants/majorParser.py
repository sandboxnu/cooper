import json
import sys


def parse_majors_from_json(input_file: str, output_file: str) -> None:
    """
    Parse major names from a JSON file and write them to an output file in JavaScript array format.

    Args:
        input_file (str): Path to the input JSON file
        output_file (str): Path to the output file where major names will be written

    Raises:
        FileNotFoundError: If the input file cannot be found
        json.JSONDecodeError: If the input file is not valid JSON
        KeyError: If the expected JSON structure is not found
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'supportedMajors' not in data or '2024' not in data['supportedMajors']:
            raise KeyError("Required JSON structure not found")

        major_names = list(data['supportedMajors']['2024'].keys())

        major_names.sort()

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("const majors = [\n")
            for i, major in enumerate(major_names):
                comma = "," if i < len(major_names) - 1 else ""
                major_escaped = major.replace("'", "\\'")
                f.write(f"  '{major_escaped}'{comma}\n")
            f.write("];\n")

        print(
            f"Successfully extracted {len(major_names)} majors to {output_file}")

    except FileNotFoundError:
        print(f"Error: Could not find input file '{input_file}'")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: '{input_file}' is not a valid JSON file")
        sys.exit(1)
    except KeyError as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        sys.exit(1)


def main():
    input_file = "supportedMajors.json"
    output_file = "majors.js"

    parse_majors_from_json(input_file, output_file)


if __name__ == "__main__":
    main()
