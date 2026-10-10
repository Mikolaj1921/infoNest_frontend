// ua: конвертер
// ua: конвертація рядка base64 (з буфера) у стандартний файл файл для відправки через формдата

export const convertBase64ToFile = (
  base64String: string,
  fileName: string = 'screenshot.png',
): File | null => {
  // check if the base64 string is valid
  const arr = base64String.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
};
