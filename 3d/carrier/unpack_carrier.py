"""Verify and unpack the checked-in Carrier 3D snapshot."""
import hashlib
import io
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parent
parts = [root / f"Carrier-3D.zip.part{i:02d}" for i in range(3)]
data = b"".join(part.read_bytes() for part in parts)
if hashlib.sha256(data).hexdigest() != "62050d9b892cbc757e2d5983d005f428d74381ad0d732381323ffcdf9a8018e0":
    raise SystemExit("Archive checksum mismatch. Re-download all three binary files.")
expected = {"Carrier.fbx", "Carrier-Albedo.jpg", "Carrier-Matte.blend"}
with ZipFile(io.BytesIO(data)) as archive:
    if set(archive.namelist()) != expected:
        raise SystemExit("Unexpected archive contents.")
    dest = root / "Carrier-3D"
    dest.mkdir(exist_ok=False)
    archive.extractall(dest)
print(f"Extracted to {dest}")
