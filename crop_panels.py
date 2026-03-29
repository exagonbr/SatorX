import sys
from PIL import Image, ImageDraw

def find_panels(img_path):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    
    # Let's find horizontal lines and vertical lines of the borders.
    # The borders are tan/gold (e.g. RGB around 200, 160, 100) on black.
    # Or we can just find the bounding box of each quadrant.
    # Top-Left quadrant: x in 0..w//2, y in 0..h
    # Actually, let's just use the crop coordinates based on the headers.
    
    # We can write a script to find non-black bounding boxes in 4 quadrants.
    def get_bbox(x0, y0, x1, y1):
        min_x, min_y, max_x, max_y = x1, y1, x0, y0
        found = False
        for y in range(y0, y1):
            for x in range(x0, x1):
                r, g, b = img.getpixel((x, y))
                # Ignore very dark pixels and text (white/gold)
                # Actually, just finding any non-black pixel that is part of the image
                # The images are enclosed in a gold border.
                # Let's just find the gold border.
                if r > 50 or g > 50 or b > 50:
                    if x < min_x: min_x = x
                    if x > max_x: max_x = x
                    if y < min_y: min_y = y
                    if y > max_y: max_y = y
                    found = True
        return (min_x, min_y, max_x, max_y) if found else None

    print(f"Image size: {w}x{h}")
    # This might include text above the images.
    # Let's do a different approach:
    # Save the 4 quadrants to disk so we can look at them or just use them if they are good enough.
    
    # Actually, a better way is to use a simple edge detection or contour finding.
    pass

if __name__ == "__main__":
    find_panels(sys.argv[1])
