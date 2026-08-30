import Papa from 'papaparse';

// Use 'export type' for TypeScript interfaces/types
export type ParsedCSVResult = {
  emails: string[];
  valid: string[];
  invalid: string[];
  totalRows: number;
};

export const parseCSVFile = (file: File): Promise<ParsedCSVResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Try to parse as CSV
        const result = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          trimHeaders: true,
        });

        // Check if we have an 'email' column
        const emailColumn = result.meta.fields?.find(
          field => field.toLowerCase().trim() === 'email'
        );

        if (!emailColumn) {
          // If no email column, try to parse as simple text (one email per line)
          const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('email')); // Skip header if present

          const emails = lines;
          const { valid, invalid } = validateEmailList(emails);
          
          resolve({
            emails,
            valid,
            invalid,
            totalRows: emails.length
          });
        } else {
          // Extract emails from CSV
          const emails = result.data
            .map((row: any) => row[emailColumn]?.trim() || '')
            .filter((email: string) => email.length > 0);

          const { valid, invalid } = validateEmailList(emails);
          
          resolve({
            emails,
            valid,
            invalid,
            totalRows: emails.length
          });
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

const validateEmailList = (emails: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach(email => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
};