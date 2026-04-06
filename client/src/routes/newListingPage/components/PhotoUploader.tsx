import React, { useCallback, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ImagePlus,
  X,
  CheckCircle,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import type { UploadedImage } from '../wizardTypes';
import { useUploadThing } from '../../../lib/uploadthing';
import styles from './PhotoUploader.module.scss';

const MAX_FILES = 10;
const MAX_SIZE_MB = 4;

// ── Sortable photo item ────────────────────────────────────────────────────────
interface SortablePhotoProps {
  image: UploadedImage;
  isMain: boolean;
  onRemove: (id: string) => void;
}

const SortablePhoto: React.FC<SortablePhotoProps> = ({ image, isMain, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.localId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.photoItem,
        isMain ? styles.mainPhoto : '',
        image.status === 'error' ? styles.errorPhoto : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {image.localPreview && (
        <img src={image.localPreview} alt="Podgląd" className={styles.photoImg} />
      )}

      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(image.localId)}
        aria-label="Usuń zdjęcie"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      {isMain && <div className={styles.mainBadge}>Zdjęcie główne</div>}

      {image.status === 'uploading' && (
        <div className={styles.uploadOverlay}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${image.progress}%` }} />
          </div>
          <span className={styles.progressText}>{image.progress}%</span>
        </div>
      )}

      {image.status === 'success' && (
        <div className={styles.successIndicator}>
          <CheckCircle size={16} />
        </div>
      )}

      {image.status === 'error' && (
        <div className={styles.errorOverlay}>
          <AlertCircle size={18} />
          <span>Błąd uploadu</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => onRemove(image.localId)}
          >
            Usuń i dodaj ponownie
          </button>
        </div>
      )}
    </div>
  );
};

// ── PhotoUploader ──────────────────────────────────────────────────────────────
interface PhotoUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ images, onChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { startUpload, isUploading } = useUploadThing('listingImages', {
    headers: async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    onUploadProgress: (progress: number) => {
      onChange(
        images.map((img) =>
          img.status === 'uploading' ? { ...img, progress } : img
        )
      );
    },
    onUploadError: () => {
      onChange(
        images.map((img) =>
          img.status === 'uploading' ? { ...img, status: 'error' as const } : img
        )
      );
    },
  });

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const remaining = MAX_FILES - images.length;
      if (remaining <= 0) return;

      const valid = fileArr
        .filter((f) => f.type.startsWith('image/'))
        .filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024)
        .slice(0, remaining);

      if (valid.length === 0) return;

      // Create placeholder items with local previews
      const newItems: UploadedImage[] = valid.map((file, i) => ({
        localId: `${Date.now()}-${i}`,
        url: '',
        order: images.length + i,
        status: 'uploading' as const,
        progress: 0,
        localPreview: URL.createObjectURL(file),
      }));

      const next = [...images, ...newItems];
      onChange(next);

      // Upload via uploadthing SDK
      try {
        const results = await startUpload(valid);
        if (!results) {
          onChange(
            next.map((img) =>
              newItems.some((n) => n.localId === img.localId)
                ? { ...img, status: 'error' as const }
                : img
            )
          );
          return;
        }

        onChange(
          next.map((img) => {
            const newItemIndex = newItems.findIndex((n) => n.localId === img.localId);
            if (newItemIndex === -1) return img;
            const result = results[newItemIndex];
            if (!result) return { ...img, status: 'error' as const };
            // ufsUrl is the current field in uploadthing v7; url is deprecated
            const fileUrl = result.ufsUrl || (result as { url?: string }).url || '';
            return { ...img, url: fileUrl, status: 'success' as const, progress: 100 };
          })
        );
      } catch {
        onChange(
          next.map((img) =>
            newItems.some((n) => n.localId === img.localId)
              ? { ...img, status: 'error' as const }
              : img
          )
        );
      }
    },
    [images, onChange, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemove = (localId: string) => {
    const updated = images
      .filter((img) => img.localId !== localId)
      .map((img, i) => ({ ...img, order: i }));
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.localId === active.id);
    const newIndex = images.findIndex((img) => img.localId === over.id);

    const reordered = [...images];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onChange(reordered.map((img, i) => ({ ...img, order: i })));
  };

  const canAddMore = images.length < MAX_FILES;

  return (
    <div className={styles.uploader}>
      {canAddMore && (
        <div
          className={[styles.dropZone, isDragOver ? styles.dragOver : ''].filter(Boolean).join(' ')}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          aria-label="Dodaj zdjęcia"
        >
          <ImagePlus size={28} className={styles.dropIcon} />
          <p className={styles.dropText}>
            Przeciągnij zdjęcia tutaj lub{' '}
            <span className={styles.dropLink}>wybierz z dysku</span>
          </p>
          <p className={styles.dropHint}>
            Max {MAX_FILES} zdjęć · maks. {MAX_SIZE_MB}MB każde · JPG, PNG, WebP
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className={styles.hiddenInput}
            aria-hidden
          />
        </div>
      )}

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((img) => img.localId)} strategy={rectSortingStrategy}>
            <div className={styles.photoGrid}>
              {images.map((img, i) => (
                <SortablePhoto
                  key={img.localId}
                  image={img}
                  isMain={i === 0}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length > 0 && (
        <p className={styles.reorderHint}>
          Przeciągnij zdjęcia, żeby zmienić kolejność. Pierwsze zdjęcie to miniatura ogłoszenia.
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;
