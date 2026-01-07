from PIL import Image

# Open the logo
img = Image.open('src/assets/fox-logo.png')

# Ensure it's in RGBA mode
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Create a white background image
white_bg = Image.new('RGBA', img.size, (255, 255, 255, 255))

# Composite the logo on top of white background
composite = Image.alpha_composite(white_bg, img)

# Convert to RGB (no alpha channel)
final = composite.convert('RGB')

# Save
final.save('src/assets/fox-logo.png', 'PNG')

print("Successfully converted logo to white background - no transparency!")
