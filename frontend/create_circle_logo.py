from PIL import Image, ImageDraw

input_path = 'd:\\finpixe\\freezed v2\\frontend\\src\\assets\\fox-logo-v3.png'
output_path = 'd:\\finpixe\\freezed v2\\frontend\\src\\assets\\fox-logo-circle.png'

print(f"Processing {input_path}...")

try:
    # Open the transparent fox logo
    foreground = Image.open(input_path).convert("RGBA")
    w, h = foreground.size
    
    # Create a new blank image with same dimensions
    background = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    
    # Draw a white circle
    draw = ImageDraw.Draw(background)
    # Draw circle fitting the image
    draw.ellipse((0, 0, w, h), fill="white")
    
    # Paste the fox on top (using itself as mask for transparency)
    # But wait, we want the circle to be BEHIND the fox.
    # So we just Alpha Composite.
    
    # Composite: Background (White Circle) <- Foreground (Fox)
    combined = Image.alpha_composite(background, foreground)
    
    combined.save(output_path, "PNG")
    print(f"Successfully saved to {output_path}")

except Exception as e:
    print(f"Error: {e}")
