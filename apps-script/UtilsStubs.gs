function preparedAction_(action, message, payload) {
  return ok_({
    action: action,
    payload: payload || {},
    implemented: false
  }, message || "Acción preparada para una fase posterior.");
}

