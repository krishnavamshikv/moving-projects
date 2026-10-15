from bank import value

def test_value_hello():
  assert value(" HELLO ") == 0
  assert value("hello, man") == 0
  assert value("hello, come on what are you doing") == 0

def test_value_h():
  assert value("Hey, how are you ?") == 20
  assert value("How is it going ? ") == 20
  assert value("hang on") ==  20

def test_value_anything():
  assert value("whats up bro? ") == 100
  assert value("shall we dance ?") == 100
  assert value("your money is safe with us") == 100
