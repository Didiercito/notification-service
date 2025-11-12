import * as fs from 'fs/promises';
import * as path from 'path';

export const loadTemplate = async (
  templateName: string,
  variables: Record<string, string>
): Promise<string> => {
  try {
    const templatePath = path.join(
      __dirname,
      '../../templates', 
      templateName
    );

    let html = await fs.readFile(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value);
    }

    return html;
  } catch (error) {
    console.error(`Error al cargar el template ${templateName}:`, error);
    throw new Error('Error interno al preparar el correo.');
  }
};