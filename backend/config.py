"""Loads .env and configures cognee's local data directories.

Import this module BEFORE doing anything with cognee so provider/key env vars
are visible to LiteLLM and the on-disk location is deterministic.
"""
import pathlib
from dotenv import load_dotenv

_HERE = pathlib.Path(__file__).resolve().parent

# Load env vars (LLM_PROVIDER/LLM_MODEL/LLM_API_KEY/EMBEDDING_*) before importing cognee.
load_dotenv(_HERE / ".env")

import cognee  # noqa: E402  (must come after load_dotenv)

# Pin cognee's local stores inside backend/ so we know exactly what to wipe for a clean run.
cognee.config.system_root_directory(str(_HERE / ".cognee_system"))
cognee.config.data_root_directory(str(_HERE / ".cognee_data"))
