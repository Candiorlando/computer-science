import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void logFirebaseEvent(String eventName, {Map<String, dynamic>? parameters}) {
  // Placeholder for Firebase analytics
  print('FirebaseEvent: $eventName ${parameters ?? {}}');
}

class FFLocalizations {
  static FFLocalizations _instance = FFLocalizations._internal();

  factory FFLocalizations() {
    return _instance;
  }

  FFLocalizations._internal();

  static FFLocalizations of(BuildContext context) {
    return _instance;
  }

  String getText(String key) {
    // Placeholder for localization
    return key.split('/').last;
  }
}

void safeSetState(VoidCallback callback) {
  callback();
}

class FFModel {
  void dispose() {}
}

T createModel<T extends FFModel>(BuildContext context, T Function() modelBuilder) {
  return modelBuilder();
}

extension ListDivideExtension on List<Widget> {
  List<Widget> divide(Widget separator) {
    if (isEmpty) {
      return [];
    }
    final divided = <Widget>[];
    for (var i = 0; i < length; i++) {
      divided.add(this[i]);
      if (i < length - 1) {
        divided.add(separator);
      }
    }
    return divided;
  }
}

extension FlutterFlowTextStyle on TextStyle {
  TextStyle override({
    String? fontFamily,
    Color? color,
    double? fontSize,
    FontWeight? fontWeight,
    double? letterSpacing,
    double? lineHeight,
    TextDecoration? decoration,
    FontStyle? fontStyle,
    bool useGoogleFonts = true,
  }) {
    final updated = copyWith(
      fontFamily: fontFamily,
      color: color,
      fontSize: fontSize,
      fontWeight: fontWeight,
      letterSpacing: letterSpacing,
      height: lineHeight,
      decoration: decoration,
      fontStyle: fontStyle,
    );

    if (useGoogleFonts && fontFamily != null) {
      return GoogleFonts.getFont(
        fontFamily,
        textStyle: updated,
      );
    }

    return updated;
  }
}
