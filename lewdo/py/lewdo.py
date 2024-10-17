
from string3 import string3

class lewdo:
    def __init__(self) -> None:
        self.input = string3();
        self.output = string3();
    def on_input(self, newIn=None):
        if (newIn is not None):
            self.input = newIn
        return self.output;