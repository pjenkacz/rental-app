import React from 'react';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  optional = false,
  hint,
  children,
}) => {
  return (
    <div className={[styles.field, error ? styles.hasError : ''].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {optional && <span className={styles.optional}>(opcjonalne)</span>}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
