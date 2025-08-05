import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Save, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import {
  DEER_SPECIES,
  SEX_OPTIONS,
  MATURITY_OPTIONS,
  TIME_OF_DAY_OPTIONS
} from '../types';
import { isValidGridReference } from '../utils/gridReference';
import { getDatabase } from '../database/database';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FormGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  min-height: 100px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.$hasError ? props.theme.colors.error : props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.typography.fontFamily};
  font-size: ${props => props.theme.typography.fontSize.md};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  resize: vertical;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

// Form data interface
interface EntryFormData {
  date: string;
  species: string;
  sex: 'Male' | 'Female' | 'Unknown';
  maturity: 'Adult' | 'Juvenile' | 'Unknown';
  weight: number;
  gridRef: string;
  location: string;
  shooter: string;
  timeOfDay: 'Dawn' | 'Morning' | 'Afternoon' | 'Dusk' | 'Night';
  remarks?: string;
}

// Simple validation function
const validateForm = (data: EntryFormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!data.date) errors.date = 'Date is required';
  if (!data.species) errors.species = 'Species is required';
  if (!data.sex) errors.sex = 'Sex is required';
  if (!data.maturity) errors.maturity = 'Maturity is required';
  if (!data.weight || data.weight <= 0) errors.weight = 'Weight must be positive';
  if (data.weight > 500) errors.weight = 'Weight seems unrealistic (max 500kg)';
  if (!data.gridRef) errors.gridRef = 'Grid reference is required';
  else if (!isValidGridReference(data.gridRef)) errors.gridRef = 'Invalid UK grid reference format';
  if (!data.location) errors.location = 'Location is required';
  if (!data.shooter) errors.shooter = 'Shooter name is required';
  if (!data.timeOfDay) errors.timeOfDay = 'Time of day is required';

  return errors;
};

export const DataEntry: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EntryFormData>({
    mode: 'onBlur',
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      species: '',
      sex: 'Unknown',
      maturity: 'Unknown',
      weight: 0,
      gridRef: '',
      location: '',
      shooter: '',
      timeOfDay: 'Morning',
      remarks: '',
    },
  });

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setFormErrors({});

    // Validate form data
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const db = getDatabase();
      const recordId = db.insertRecord(data);
      console.log('Saved record with ID:', recordId);

      setSubmitSuccess(true);
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        species: '',
        sex: 'Unknown',
        maturity: 'Unknown',
        weight: 0,
        gridRef: '',
        location: '',
        shooter: '',
        timeOfDay: 'Morning',
        remarks: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const speciesOptions = DEER_SPECIES.map(species => ({
    value: species,
    label: species,
  }));

  const sexOptions = SEX_OPTIONS.map(sex => ({
    value: sex,
    label: sex,
  }));

  const maturityOptions = MATURITY_OPTIONS.map(maturity => ({
    value: maturity,
    label: maturity,
  }));

  const timeOfDayOptions = TIME_OF_DAY_OPTIONS.map(time => ({
    value: time,
    label: time,
  }));

  return (
    <FormContainer>
      <Card>
        <CardHeader>
          <CardTitle>New Deer Stalking Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <SuccessMessage>
              Record saved successfully!
            </SuccessMessage>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGrid>
              <FormSection>
                <Input
                  label="Date"
                  type="date"
                  {...register('date')}
                  error={formErrors.date || errors.date?.message}
                  fullWidth
                />

                <Select
                  label="Species"
                  options={speciesOptions}
                  placeholder="Select species"
                  {...register('species')}
                  error={formErrors.species || errors.species?.message}
                  fullWidth
                />

                <Select
                  label="Sex"
                  options={sexOptions}
                  {...register('sex')}
                  error={formErrors.sex || errors.sex?.message}
                  fullWidth
                />

                <Select
                  label="Maturity"
                  options={maturityOptions}
                  {...register('maturity')}
                  error={formErrors.maturity || errors.maturity?.message}
                  fullWidth
                />
              </FormSection>

              <FormSection>
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  {...register('weight', { valueAsNumber: true })}
                  error={formErrors.weight || errors.weight?.message}
                  fullWidth
                />

                <Input
                  label="Grid Reference"
                  placeholder="e.g. SO 123 456"
                  {...register('gridRef')}
                  error={formErrors.gridRef || errors.gridRef?.message}
                  fullWidth
                />

                <Input
                  label="Location"
                  placeholder="e.g. Woodland near Hereford"
                  {...register('location')}
                  error={formErrors.location || errors.location?.message}
                  fullWidth
                />

                <Input
                  label="Shooter"
                  placeholder="Name of shooter"
                  {...register('shooter')}
                  error={formErrors.shooter || errors.shooter?.message}
                  fullWidth
                />

                <Select
                  label="Time of Day"
                  options={timeOfDayOptions}
                  {...register('timeOfDay')}
                  error={formErrors.timeOfDay || errors.timeOfDay?.message}
                  fullWidth
                />
              </FormSection>

              <FullWidthSection>
                <div>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    marginBottom: '0.25rem', 
                    display: 'block' 
                  }}>
                    Remarks (Optional)
                  </label>
                  <TextArea
                    placeholder="Additional notes, observations, or comments..."
                    {...register('remarks')}
                    $hasError={!!(formErrors.remarks || errors.remarks)}
                  />
                  {(formErrors.remarks || errors.remarks) && (
                    <ErrorMessage>
                      <AlertCircle size={16} />
                      {formErrors.remarks || errors.remarks?.message}
                    </ErrorMessage>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  fullWidth
                  size="lg"
                >
                  <Save size={20} />
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </Button>
              </FullWidthSection>
            </FormGrid>
          </form>
        </CardContent>
      </Card>
    </FormContainer>
  );
};
