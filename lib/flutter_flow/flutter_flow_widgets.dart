import 'package:flutter/material.dart';

class FFModel {
  void dispose() {}
}

class FlutterFlowModelNotifier extends ChangeNotifier {
  void Function()? onUpdate;

  void setUpdate(void Function()? callback) {
    onUpdate = callback;
  }

  void update() {
    notifyListeners();
  }
}

Widget wrapWithModel<T extends FFModel>({
  required T model,
  required Widget child,
  required Function() updateCallback,
}) {
  return child;
}
