const codeReader = new ZXing.BrowserMultiFormatReader();

async function scanQRCode() {
  const videoInputDevices = await codeReader.listVideoInputDevices();
  const selectedDeviceId = videoInputDevices[0].deviceId;

  return new Promise((resolve, reject) => {
    codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      "video",
      (result, err) => {
        if (result) {
          resolve(result.text);
          codeReader.reset();
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.error(err);
          reject(err);
          codeReader.reset();
        }
      }
    );
  });
}

async function stopScanning() {
  codeReader.reset();
}