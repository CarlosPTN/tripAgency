function toCamelCase(str) {
  if (str.length === 0) {
    return "";
  }

  if (str[0] !== str[0].toUpperCase()) {
    return str
      .split(/[-_]/)
      .map((word, index) => {
        if (index !== 0) {
          return word[0].toUpperCase() + word.slice(1);
        } else {
          return word;
        }
      })
      .join("");
  } else {
    return str
      .split(/[-_]/)
      .map((word, index) => {
        return word[0].toUpperCase() + word.slice(1);
      })
      .join("");
  }
}
