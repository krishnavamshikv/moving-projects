from calculator import square

def test_square_postive():
  assert square(2) == 4
  assert square(3) == 9

def test_square_negative():
  assert square(-2) == 4
  assert square(-3) == 9

def test_square_zero():
  assert square(0) == 0
