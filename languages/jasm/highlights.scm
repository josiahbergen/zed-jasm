; languages/jasm/highlights.scm

(mnemonic) @keyword

(register) @property
(register_pair) @property

(label
  (label_name) @label)

(operand
  (label_name) @constant)

"MACRO" @keyword
"END MACRO" @keyword

(macro
    (label_name) @keyword)

; Macro arguments "%arg"
(macro_arg) @property

(macro_call
  (label_name) @function)

; Ensure the arguments inside the macro call still highlight correctly
(macro_call
    (op_list
        (operand
            (register) @variable.builtin)))

"DATA" @emphasis.strong
(number) @number
(string) @string
(comment) @comment

[
  ","
  ":"
] @punctuation.delimiter

(operator) @operator
