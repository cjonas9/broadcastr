"""
This module contains global constants for the broadcastr backend.
"""

# BROADCASTR_DB..... see sql_query.py

DEFAULT_PFP = "https://w7.pngwing.com/pngs/135/630/png-transparent-falling-in-love-woman-anxiety-student-others-angle-woman-ecchi-thumbnail.png"

# Time, in seconds, the system will wait after/between calls to the last.fm API
LAST_FM_API_CALL_SLEEP_TIME = 0.05

# User data will be refreshed on login after this many days
REFRESH_DAYS = "1"

# Periods use when refreshing top artist/track data
REFRESH_PERIODS = ["overall", "7day", "1month", "12month"]

SYSTEM_ACCOUNT_ID = 1
