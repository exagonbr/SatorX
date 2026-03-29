from PIL import Image
import numpy as np

img = Image.open('src/public/img/panel3_texto.png').convert('RGBA')
data = np.array(img)

# Checkerboard is typically 206,206,206 and 255,255,255 or 254,254,254
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

is_gray = (r == 204) & (g == 204) & (b == 204)
is_gray2 = (r == 206) & (g == 206) & (b == 206)
is_white = (r == 255) & (g == 255) & (b == 255)

bg_mask = is_gray | is_gray2 | is_white

# Count how many background pixels vs foreground pixels
print("Total pixels:", data.shape[0]*data.shape[1])
print("Background pixels:", np.sum(bg_mask))
