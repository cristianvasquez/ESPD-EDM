function dbToJson ({ objects, objectProperties, attributes, connectors }) {

  const nodeIndex = {}
  for (const object of objects) {
    const {
      Object_ID,
      Name,
    } = object
    nodeIndex[Object_ID] = {
      id: Object_ID,
      name: Name,
    }
  }

  const nodes = objects.map(x => {
    return {
      id: x.Object_ID,
      type: x.Object_Type,
      name: x.Name,
      description: x.Note,
      status: x.Status,
      createdDate: x.CreatedDate,
      modifiedDate: x.ModifiedDate,
    }
  })

  const edges = [
    ...attributes.map(toLiteralRelation(nodeIndex)),
    ...connectors.map(toObjectRelation(nodeIndex))]

  return { nodes, edges }
}

const toLiteralRelation = nodeIndex => x => {
  const { Object_ID, Name, Type, LowerBound, UpperBound, Notes, Stereotype } = x

  const predicate = Name
  const target = Type

  return {
    eaId: Object_ID,
    type: 'Attribute',
    source: nodeIndex[Object_ID],
    predicate,
    target,
    quantifiers: getQuantifierFromBounds({ LowerBound, UpperBound }),
    description: Notes,
  }
}

const toObjectRelation = nodeIndex => x => {
  const {
    Connector_ID,
    DestRole,
    Start_Object_ID,
    End_Object_ID,
    Connector_Type,
    Direction,
    DestCard,
    Notes,
  } = x

  return {
    eaId: Connector_ID,
    source: nodeIndex[Start_Object_ID],
    type: Connector_Type,
    target: nodeIndex[End_Object_ID],
    quantifiers: getQuantifierFromString(DestCard),
    description: Notes,
  }
}

function getQuantifierFromBounds ({ LowerBound, UpperBound }) {

  return !(LowerBound || UpperBound) ? {
    quantifiersDeclared: false,
  } : {
    min: LowerBound,
    max: UpperBound === '*' ? undefined : UpperBound,
    quantifiersDeclared: true,
  }
}

function getQuantifierFromString (str) {
  const raw = { quantifiersDeclared: true, raw: str }
  if (str === '0..1') {
    return { min: 0, max: 1, ...raw }
  } else if (str === '1') {
    return { min: 1, max: 1, ...raw }
  } else if (str === '1..*') {
    return { min: 1, ...raw }
  } else if (str === '0..*') {
    return raw
  } else return {
    quantifiersDeclared: false,
  }
}

export { dbToJson }
