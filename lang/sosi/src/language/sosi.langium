grammar Sosi

entry Specification:
    'specification'
    (description=STRING)? name = QName
    (types += Type)*;

Name returns string: (ID | STRING);

QName returns string:
    Name ('.' Name)*;

Type: BuiltinType | CompositeType;

CompositeType:
    (isAbstract ?= 'abstract')?
    (kind = ('data' | 'feature'))?
    'type'
    (description=STRING)?
    (name = Name)?
    ('extends' (extends += [Type:Name]) (',' extends += [Type:Name])*)?
    '{'
      (properties += Property)+
    '}'
    (mappings += DomainMapping)*
  ;

PropertyKind returns string: ('@' | '#' | '^');

PropertyType: TypeRef | InlineType;

TypeRef: typeRef = [Type:Name];
InlineType: type = Type;

Property:
    (kind = PropertyKind)?
    (description=STRING)?
    name = Name
    (multiplicity = Multiplicity)? ':'
    type = PropertyType
    (mappings += DomainMapping)*
  ;

Multiplicity: ZeroOrMoreMultiplicity | OneOrMoreMultiplicity | ZeroOrOneMultiplicity | SomeMultiplicity;

ZeroOrMoreMultiplicity: spec = '*';
OneOrMoreMultiplicity: spec = '+';
ZeroOrOneMultiplicity: spec = '?';
SomeMultiplicity: lower = '[' INT ('..' (upper = INT)?) ']';

BuiltinType:
  'builtin' (name = Name)?
  (mappings += DomainMapping)*
  ;

DomainMapping:
  'as' domain = QName target = (QName | STRING);

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
