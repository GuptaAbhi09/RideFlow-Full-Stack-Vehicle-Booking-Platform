export function randomID(len: number) {
  let result = '';
  if (result) return result;
  let chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export const getZegoConfig = () => {
  return {
    appID: Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID),
    serverSecret: process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string,
  }
}
