from flask import Flask, request, send_file, render_template
import os

app = Flask(__name__)

def file_to_binary(file_path):
    with open(file_path, 'rb') as file:
        binary_data = file.read()
    return ''.join(format(byte, '08b') for byte in binary_data)

def binary_to_file(binary_string, output_file):
    byte_array = bytearray(int(binary_string[i:i+8], 2) for i in range(0, len(binary_string), 8))
    with open(output_file, 'wb') as file:
        file.write(byte_array)

def compress_binary(binary_string):
    compressed = ""
    count = 1
    for i in range(1, len(binary_string)):
        if binary_string[i] == binary_string[i - 1]:
            count += 1
        else:
            if count >= 3:
                compressed += f"{count}{binary_string[i - 1]}"
            else:
                compressed += binary_string[i - count:i]
            count = 1
    if count >= 3:
        compressed += f"{count}{binary_string[-1]}"
    else:
        compressed += binary_string[-count:]
    return compressed

def decompress_binary(compressed_string):
    binary_string = ""
    i = 0
    while i < len(compressed_string):
        if compressed_string[i].isdigit():
            count = int(compressed_string[i])
            char = compressed_string[i + 1]
            binary_string += char * count
            i += 2
        else:
            binary_string += compressed_string[i]
            i += 1
    return binary_string

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compress', methods=['POST'])
def compress_file():
    file = request.files['file']
    file_path = "uploaded.bin"
    file.save(file_path)

    binary_data = file_to_binary(file_path)
    compressed_data = compress_binary(binary_data)

    compressed_path = "compressed.txt"
    with open(compressed_path, 'w') as file:
        file.write(compressed_data)

    return send_file(compressed_path, as_attachment=True)

@app.route('/decompress', methods=['POST'])
def decompress_file():
    file = request.files['file']
    file_path = "uploaded_compressed.txt"
    file.save(file_path)

    with open(file_path, 'r') as file:
        compressed_data = file.read()

    binary_data = decompress_binary(compressed_data)
    decompressed_path = "decompressed.bin"
    binary_to_file(binary_data, decompressed_path)

    return send_file(decompressed_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True
