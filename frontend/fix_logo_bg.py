from PIL import Image
import os

# Path to the logo
logo_path = os.path.join('src', 'assets', 'fox-logo.png')

# Open the image
img = Image.open(logo_path)

# Convert to RGBA
img = img.convert('RGBA')

# Get image data
datas = img.getdata()

# Create new data with white background
newData = []
for item in datas:
    # If pixel is transparent (alpha < 255), make it white
    if item[3] < 255:
        newData.append((255, 255, 255, 255))
    else:
        newData.append(item)

# Update image data
img.putdata(newData)

# Convert to RGB (removes alpha channel completely)
rgb_img = Image.new('RGB', img.size, (255, 255, 255))
rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask

# Save
rgb_img.save(logo_path)

print(f"Successfully converted {logo_path} - all transparent pixels replaced with white")
