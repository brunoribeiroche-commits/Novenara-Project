#!/usr/bin/env python3
"""Export one Git revision's Novenara static site, without deployment."""
import argparse
import gzip
import hashlib
import io
import os
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tarfile
import tempfile


def git(*args):
    proc = subprocess.run(["git", *args], stdout=subprocess.PIPE, check=True)
    return proc.stdout


def release(revision, output):
    commit = git("rev-parse", "--verify", "--end-of-options", revision + "^{commit}").decode().strip()
    entries = git("ls-tree", "-rz", commit, "--", "dist").split(b"\0")
    expected = {}
    for item in filter(None, entries):
        meta, name = item.split(b"\t", 1)
        mode, kind, oid = meta.split()
        path = name.decode("utf-8")
        if kind != b"blob" or mode not in (b"100644", b"100755"):
            raise ValueError(f"Only regular tracked deployment files are supported: {path}")
        if (not path.startswith("dist/") or
                any(p.startswith(".") for p in PurePosixPath(path).parts) or
                "\\" in path or any(ord(c) < 32 for c in path)):
            raise ValueError(f"Not an eligible static path: {path!r}")
        expected[path] = oid.decode("ascii")
    missing = {"dist/index.html", "dist/grid/index.html"} - expected.keys()
    if missing:
        raise ValueError("Revision is missing static entry points: " + ", ".join(sorted(missing)))

    # A commit (not a subtree) gives archive members the commit's timestamp.
    # Keep dist/ as the only top-level folder; set gzip metadata deterministically.
    raw = git("archive", "--format=tar", commit, "dist")
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:") as archive:
        actual = {member.name for member in archive.getmembers() if member.isfile()}
        if actual != expected.keys():
            raise ValueError("Archive inventory differs from tracked dist/; check .gitattributes.")
        for path, oid in expected.items():
            file = archive.extractfile(path)
            if file is None or file.read() != git("cat-file", "blob", oid):
                raise ValueError(f"Archive content differs from tracked Git blob: {path}")

    output = Path(output or f"release/novenara-{commit[:12]}.tar.gz")
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, prefix=".novenara-", delete=False) as f:
            temp = Path(f.name)
            with gzip.GzipFile(fileobj=f, mode="wb", filename="", mtime=0, compresslevel=9) as wrapped:
                wrapped.write(raw)
        # An existing release is never overwritten (including concurrent runs).
        os.link(temp, output)
    finally:
        if temp is not None:
            temp.unlink(missing_ok=True)

    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    print("Git revision:", commit)
    print("Static files:", len(expected))
    print("Archive:", output)
    print("SHA-256:", digest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("revision", help="Explicit Git commit SHA, tag, or branch to export")
    parser.add_argument("--output", metavar="PATH", help="Do not use an existing file")
    args = parser.parse_args()
    try:
        release(args.revision, args.output)
    except (OSError, ValueError, subprocess.CalledProcessError) as e:
        parser.exit(1, f"Package failed: {e}\n")


if __name__ == "__main__":
    main()
