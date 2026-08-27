"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Trả thẳng đơn vị "px" (không phải "%") để dùng được luôn làm completedCrop mặc định —
// nhờ vậy bấm "Dùng ảnh này" ngay không cần kéo tay cũng cắt đúng khung giữa ảnh.
function centeredAspectCrop(width: number, height: number, aspectRatio: number): PixelCrop {
  const percentCrop = centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspectRatio, width, height),
    width,
    height
  );
  return {
    unit: "px",
    x: (percentCrop.x / 100) * width,
    y: (percentCrop.y / 100) * height,
    width: (percentCrop.width / 100) * width,
    height: (percentCrop.height / 100) * height,
  };
}

function getCroppedFile(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<File> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Không tạo được canvas"));

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Không cắt được ảnh"));
        resolve(new File([blob], fileName.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

interface ImageCropModalProps {
  file: File | null;
  onCancel: () => void;
  onCropped: (file: File) => void;
  /** Tỉ lệ khung crop, mặc định 3:4 (ảnh sản phẩm). Vd 21/9 cho banner ngang. */
  aspectRatio?: number;
  /** Nhãn tỉ lệ hiển thị trong tiêu đề modal, vd "3:4" hoặc "21:9". */
  aspectLabel?: string;
}

export function ImageCropModal({
  file,
  onCancel,
  onCropped,
  aspectRatio = 3 / 4,
  aspectLabel = "3:4",
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [crop, setCrop] = useState<PixelCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  if (!file || !objectUrl) return null;

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedFile(imgRef.current, completedCrop, file.name);
      onCropped(cropped);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white max-w-lg w-full p-5 space-y-4">
        <div>
          <h2 className="text-sm font-medium tracking-widest uppercase">Cắt ảnh ({aspectLabel})</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Kéo/chỉnh khung để giữ đúng phần ảnh muốn hiển thị — tránh bị cắt mất góc khi lên trang.
          </p>
        </div>

        <div className="max-h-[60vh] overflow-auto flex justify-center bg-dwarfs-surface">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop) => setCrop(pixelCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={objectUrl}
              alt="Ảnh cần cắt"
              className="max-w-full block"
              onLoad={(e) => {
                const initial = centeredAspectCrop(
                  e.currentTarget.width,
                  e.currentTarget.height,
                  aspectRatio
                );
                setCrop(initial);
                setCompletedCrop(initial);
              }}
            />
          </ReactCrop>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="text-xs underline-anim" disabled={processing}>
            Huỷ
          </button>
          <button type="button" onClick={handleConfirm} disabled={processing} className="btn-primary">
            {processing ? "Đang xử lý..." : "Dùng ảnh này"}
          </button>
        </div>
      </div>
    </div>
  );
}
