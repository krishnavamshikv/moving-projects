from twttr import shorten


def test_lowercase():
    assert shorten("twitter") == "twttr"
    assert shorten("hello") == "hll"


def test_uppercase():
    assert shorten("TWITTER") == "TWTTR"
    assert shorten("PYTHON") == "PYTHN"


def test_numbers():
    assert shorten("CS50") == "CS50"
    assert shorten("12345") == "12345"


def test_punctuation():
    assert shorten("What's your name?") == "Wht's yr nm?"
    assert shorten("hello, world!") == "hll, wrld!"