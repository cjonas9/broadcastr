"""
Enumeration of related types.  Used for linking likes and broadcasts
to other entities.
"""
from enum import Enum

class RelatedType(Enum):
    """
    Enumeration of related types.  Used for linking likes and broadcasts
    to other entities.
    """
    GENERAL = 1
    ALBUM = 2
    ARTIST = 3
    BROADCAST = 4
    FOLLOWING = 5
    TRACK = 6
    USER = 7
    TOPALBUM = 8
    TOPARTIST = 9
    TOPTRACK = 10
