# painterly.py in.jpg out.png [x0 y0 w h] [scale] -- turn a photo/HDRI crop into an anime-painted plate (Kuwahara + posterize + sky push)
import sys, numpy as np
from PIL import Image, ImageFilter
a=sys.argv; im=Image.open(a[1]).convert('RGB')
if len(a)>=7: x,y,w,h=map(int,a[3:7]); im=im.crop((x,y,x+w,y+h))
sc=float(a[7]) if len(a)>7 else 1.0
im=im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS)
f=np.asarray(im).astype(np.float32)/255
def box(x,r):  # box mean via integral image
    p=np.pad(x,((r+1,r),(r+1,r))+((0,0),)*(x.ndim-2),mode='edge'); c=p.cumsum(0).cumsum(1); k=2*r+1
    return (c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,:-k])/(k*k)
def kuwahara(f,r):
    L=f@np.array([.299,.587,.114],np.float32); H,W=L.shape
    m=box(f,r); m2=box(L*L,r); mL=box(L,r); v=m2-mL*mL
    best=None; bv=np.full((H,W),1e9,np.float32); out=np.zeros_like(f)
    for dy in (-r,r):
        for dx in (-r,r):
            sv=np.roll(np.roll(v,dy,0),dx,1); sm=np.roll(np.roll(m,dy,0),dx,1); sel=sv<bv; bv=np.where(sel,sv,bv); out[sel]=sm[sel]
    return out
g=kuwahara(f,4); g=kuwahara(g,2)
hsv=np.asarray(Image.fromarray((g*255).astype(np.uint8)).convert('HSV')).astype(np.float32)
hsv[...,1]=np.clip(hsv[...,1]*1.25,0,255)            # anime saturation
hsv[...,2]=np.round(hsv[...,2]/255*7)/7*255*0.85+hsv[...,2]*0.15   # soft value posterize (cel bands)
g=np.asarray(Image.fromarray(hsv.astype(np.uint8),'HSV').convert('RGB')).astype(np.float32)/255
yy=np.linspace(0,1,g.shape[0])[:,None,None]; sky=(g.mean(2,keepdims=True)>0.6)&(yy<0.55)
g=np.where(sky,g*0.75+np.array([0.55,0.75,1.0])*0.25,g)    # push bright upper area to an anime sky blue
Image.fromarray((np.clip(g,0,1)*255).astype(np.uint8)).filter(ImageFilter.SMOOTH).save(a[2])
