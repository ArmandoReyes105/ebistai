"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  CatalogKind,
  useCatalogSuggestions,
} from "@/hooks/use-catalog-suggestions"
import { isNewCatalogName } from "@/lib/domain/catalog-name"
import { JobApplicationFormValues } from "@/schemas/job-application"
import { useState } from "react"
import { Control, Controller } from "react-hook-form"

interface CatalogAutocompleteFieldProps {
  control: Control<JobApplicationFormValues>
  name: "company" | "applicationSource"
  kind: CatalogKind
  label: string
  placeholder: string
}

const HINT =
  "No está en tus sugerencias; la guardaremos como nueva."

interface FieldBodyProps {
  value: string
  name: string
  kind: CatalogKind
  placeholder: string
  invalid: boolean
  error?: { message?: string }
  onChange: (value: string) => void
  onBlur: () => void
  inputRef: React.Ref<HTMLInputElement>
  label: string
}

function CatalogAutocompleteBody({
  value,
  name,
  kind,
  placeholder,
  invalid,
  error,
  onChange,
  onBlur,
  inputRef,
  label,
}: FieldBodyProps) {
  // Captured once at mount: the edit form prefill never triggers the hint.
  const [initialValue] = useState(() => value)
  const { items, isSettled } = useCatalogSuggestions(kind, value)

  const showHint =
    isSettled && value !== initialValue && isNewCatalogName(value, items)
  const hintId = `${name}-catalog-hint`

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div>
        <Autocomplete items={items} value={value} onValueChange={onChange}>
          <AutocompleteInput
            id={name}
            name={name}
            ref={inputRef}
            onBlur={onBlur}
            aria-invalid={invalid}
            aria-describedby={showHint ? hintId : undefined}
            placeholder={placeholder}
            autoComplete="off"
          />
          <AutocompleteContent>
            <AutocompleteList>
              {(item: string) => (
                <AutocompleteItem key={item} value={item}>
                  {item}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
        <div aria-live="polite">
          {showHint && (
            <FieldDescription id={hintId} className="mt-2">
              {HINT}
            </FieldDescription>
          )}
        </div>
      </div>
      {invalid && <FieldError errors={[error]} />}
    </Field>
  )
}

// Free-text field with shared-catalog suggestions. The hint is informational
// and never blocks submit.
const CatalogAutocompleteField = ({
  control,
  name,
  kind,
  label,
  placeholder,
}: CatalogAutocompleteFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <CatalogAutocompleteBody
        value={field.value ?? ""}
        name={field.name}
        kind={kind}
        label={label}
        placeholder={placeholder}
        invalid={fieldState.invalid}
        error={fieldState.error}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
    )}
  />
)

export default CatalogAutocompleteField
