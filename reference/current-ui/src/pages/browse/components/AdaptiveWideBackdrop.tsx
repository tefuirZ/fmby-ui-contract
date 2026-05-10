import { buildSafeBackgroundStyle } from './utils';
import styles from '../BrowsePages.module.css';

export function AdaptiveWideBackdrop({
  imageUrl,
  onError,
  variant,
}: {
  imageUrl: string;
  onError?: () => void;
  variant: 'hero' | 'library-detail';
}) {
  const rootClassName = variant === 'hero' ? styles.heroBackground : styles.libraryDetailBackdrop;
  const blurClassName =
    variant === 'hero' ? styles.heroBackgroundBlur : styles.libraryDetailBackdropBlur;
  const frameClassName =
    variant === 'hero' ? styles.heroBackgroundFrame : styles.libraryDetailBackdropFrame;
  const imageClassName =
    variant === 'hero' ? styles.heroBackgroundImage : styles.libraryDetailBackdropImage;

  return (
    <div className={rootClassName}>
      <div className={blurClassName} style={buildSafeBackgroundStyle(imageUrl)} />
      <div className={frameClassName}>
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className={imageClassName}
          onError={onError}
        />
      </div>
    </div>
  );
}
