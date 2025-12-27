// Helper to create case-insensitive regex for mnemonics
function caseInsensitive(str) {
  return new RegExp(
    str
      .split("")
      .map((c) => `[${c.toLowerCase()}${c.toUpperCase()}]`)
      .join(""),
  );
}

module.exports = grammar({
  name: "jasm",

  // Ignore spaces and tabs, but NOT newlines (newlines are semantic)
  extras: ($) => [/[ \t]/, $.comment],

  rules: {
    source_file: ($) => repeat($.line),

    line: ($) =>
      seq(
        optional(choice($.instruction, $.label, $.macro, $.data, $.macro_call)),
        // We expect a newline at the end of every line
        /\n/,
      ),

    // --- Macros ---
    macro: ($) =>
      seq(
        "MACRO",
        $.label_name,
        $.macro_args,
        /\n/,
        repeat($.macro_line),
        "END MACRO",
      ),

    macro_args: ($) => seq($.macro_arg, repeat(seq(",", $.macro_arg))),

    macro_line: ($) => seq(optional(choice($.instruction, $.data)), /\n/),

    macro_arg: ($) => seq("%", $.label_name),

    macro_call: ($) => seq($.label_name, optional($.op_list)),

    // --- Instructions ---
    instruction: ($) => prec(1, seq($.mnemonic, optional($.op_list))),

    op_list: ($) => seq($._generic_op, repeat(seq(",", $._generic_op))),

    _generic_op: ($) => choice($.operand, $.macro_arg, $.expression),

    operand: ($) => choice($.register_pair, $.register, $.number, $.label_name),

    // --- Expressions ---
    // Precedence is flat in your EBNF, so we keep it simple here.
    // Tree-sitter can handle order-of-ops, but we stick to your definition.
    expression: ($) =>
      seq(
        "(",
        optional($.operator),
        $._exp_term,
        repeat(seq($.operator, $._exp_term)),
        ")",
      ),

    _exp_term: ($) => choice($.number, $.macro_arg, $.expression),

    operator: ($) =>
      choice("+", "-", "*", "/", "%", "<<", ">>", "&", "|", "^", "~"),

    // --- Data ---
    data: ($) => seq("DATA", $.constant, repeat(seq(",", $.constant))),

    constant: ($) => choice($.number, $.string),

    // --- Basic Tokens ---
    label: ($) => seq($.label_name, ":"),

    mnemonic: ($) =>
      choice(
        caseInsensitive("LOAD"),
        caseInsensitive("STORE"),
        caseInsensitive("MOVE"),
        caseInsensitive("PUSH"),
        caseInsensitive("POP"),
        caseInsensitive("ADD"),
        caseInsensitive("ADDC"),
        caseInsensitive("SUB"),
        caseInsensitive("SUBB"),
        caseInsensitive("INC"),
        caseInsensitive("DEC"),
        caseInsensitive("LSHF"),
        caseInsensitive("RSHF"),
        caseInsensitive("AND"),
        caseInsensitive("OR"),
        caseInsensitive("NOR"),
        caseInsensitive("NOT"),
        caseInsensitive("XOR"),
        caseInsensitive("INB"),
        caseInsensitive("OUTB"),
        caseInsensitive("CMP"),
        caseInsensitive("SETC"),
        caseInsensitive("CLRC"),
        caseInsensitive("CLRZ"),
        caseInsensitive("JUMP"),
        caseInsensitive("JZ"),
        caseInsensitive("JNZ"),
        caseInsensitive("JC"),
        caseInsensitive("JNC"),
        caseInsensitive("INT"),
        caseInsensitive("HALT"),
        caseInsensitive("NOP"),
      ),

    register_pair: ($) => seq($.register, ":", $.register),

    register: ($) =>
      choice(
        caseInsensitive("A"),
        caseInsensitive("B"),
        caseInsensitive("C"),
        caseInsensitive("D"),
        caseInsensitive("X"),
        caseInsensitive("Y"),
        caseInsensitive("SP"),
        caseInsensitive("PC"),
        caseInsensitive("Z"),
        caseInsensitive("F"),
        caseInsensitive("MB"),
        caseInsensitive("STS"),
      ),

    // Numbers: 0x... | 0b... | decimal
    number: ($) => choice(/0[xX][0-9a-fA-F]+/, /0[bB][01]+/, /[0-9]+/),

    string: ($) => /"[^"]*"/,

    label_name: ($) => /[a-zA-Z][a-zA-Z0-9_]*/,

    comment: ($) => /;.*/,
  },
});
