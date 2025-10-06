// Función simple que genera enlaces de búsqueda
private generateStudyLinks(materiaNombre: string): string {
  const materiaEncoded = encodeURIComponent(materiaNombre);
  
  let links = `\n\n📚 **Recursos de Estudio Recomendados:**\n\n`;
  
  links += `🎥 **Videos:**\n`;
  links += `• YouTube: https://www.youtube.com/results?search_query=${materiaEncoded}+tutorial+español\n\n`;
  
  links += `📖 **Documentos y Guías:**\n`;
  links += `• Google Scholar: https://scholar.google.com/scholar?q=${materiaEncoded}\n`;
  links += `• Academia.edu: https://www.academia.edu/search?q=${materiaEncoded}\n\n`;
  
  links += `🎓 **Cursos Online:**\n`;
  links += `• Khan Academy: https://es.khanacademy.org/search?page_search_query=${materiaEncoded}\n`;
  links += `• Coursera: https://www.coursera.org/search?query=${materiaEncoded}\n\n`;
  
  links += `🔍 **Ejercicios y Práctica:**\n`;
  links += `• Google: https://www.google.com/search?q=${materiaEncoded}+ejercicios+resueltos+pdf\n`;
  
  return links;
}