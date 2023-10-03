from PIL import Image, ImageSequence
import math

def expand_canvas(image, angle):
    """
    Expand the canvas to fit the whole rotated image without cropping.
    """
    width, height = image.size
    radians = math.radians(angle)
    new_width = int(abs(width * math.cos(radians)) + abs(height * math.sin(radians)))
    new_height = int(abs(height * math.cos(radians)) + abs(width * math.sin(radians)))

    expanded = Image.new('RGB', (new_width, new_height), color='white')
    offset = ((new_width - width) // 2, (new_height - height) // 2)
    expanded.paste(image, offset)
    
    return expanded

def retro_filter(img_path, output_path, pixel_size=8, palette_size=8):
    # Open the image
    img = Image.open(img_path)

    # Reduce the image size for pixelation effect
    small = img.resize((img.width // pixel_size, img.height // pixel_size), resample=Image.BILINEAR)

    # Scale it back to the original size
    result = small.resize(img.size, Image.NEAREST)

    # Convert to a limited color palette
    result = result.convert('P', palette=Image.ADAPTIVE, colors=palette_size)

    # Convert from 'P' mode to 'RGB' for better compatibility
    result = result.convert('RGB')
    
    # Expand the canvas to avoid cropping when rotating
    result = expand_canvas(result, 30)  # using the maximum rotation angle to ensure all rotations fit

    # Create rotations with a white background
    rotations = [-30, -15, 0, 15, 30,15,0,-15]
    frames = [result.rotate(angle, fillcolor='white') for angle in rotations]

    # Save frames as a gif
    frames[0].save(output_path, save_all=True, append_images=frames[1:], loop=0, duration=300)

# Usage
retro_filter("imgconvert/bottle2.jpeg", "output_path.gif", pixel_size=8, palette_size=8)
