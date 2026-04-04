import { Colors } from "@/constants/colors";
import { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";

export default function CourseWebViewScreen() {
  const { courseData } = useLocalSearchParams<{ courseData: string }>();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const course: Course | null = (() => {
    try {
      return courseData ? JSON.parse(courseData) : null;
    } catch {
      return null;
    }
  })();

  const animateProgress = useCallback(
    (toValue: number) => {
      Animated.timing(progressAnim, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim],
  );

  const injectCourseData = useCallback(() => {
    if (!course || !webViewRef.current) return;
    const payload = JSON.stringify({
      title: course.title,
      description: course.description,
      category: course.category,
      rating: course.rating,
      price: course.price,
      instructorName: course.instructorName,
      instructorAvatar: course.instructorAvatar,
      isEnrolled: true,
    });
    const script = `
      (function() {
        try {
          if (typeof window.receiveNativeData === 'function') {
            window.receiveNativeData(${JSON.stringify(payload)});
          }
        } catch(e) {}
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, [course]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", msg);
    } catch {}
  }, []);

  const handleLoadProgress = useCallback(
    ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setLoadProgress(nativeEvent.progress);
      animateProgress(nativeEvent.progress);
    },
    [animateProgress],
  );

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    animateProgress(1);
    setTimeout(() => {
      injectCourseData();
      animateProgress(0);
      setLoadProgress(0);
    }, 300);
  }, [injectCourseData, animateProgress]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleReload = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleNavStateChange = useCallback((state: WebViewNavigation) => {
    setNavState(state);
  }, []);

  // Build the HTML inline so no file resolution issues
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <title>Course Content</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0A0A0F;color:#F0F0FF;min-height:100vh;}
    .hero{background:linear-gradient(135deg,#7C3AED 0%,#4F46E5 50%,#06B6D4 100%);padding:32px 20px 28px;position:relative;overflow:hidden;}
    .hero::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:rgba(255,255,255,0.06);border-radius:50%;}
    .hero::after{content:'';position:absolute;bottom:-40px;left:-40px;width:150px;height:150px;background:rgba(255,255,255,0.04);border-radius:50%;}
    .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:5px 12px;border-radius:20px;margin-bottom:14px;border:1px solid rgba(255,255,255,0.2);}
    .hero h1{font-size:22px;font-weight:800;color:#fff;line-height:1.3;margin-bottom:16px;position:relative;z-index:1;}
    .instructor{display:flex;align-items:center;gap:10px;position:relative;z-index:1;}
    .instructor img{width:38px;height:38px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);object-fit:cover;}
    .instructor-info{}
    .instructor-label{font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.5px;}
    .instructor-name{font-size:13px;color:#fff;font-weight:600;}
    .enrolled-banner{background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);margin:16px;border-radius:14px;padding:12px 16px;display:none;align-items:center;gap:10px;}
    .enrolled-banner.show{display:flex;}
    .enrolled-dot{width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;}
    .enrolled-text{font-size:13px;color:#10B981;font-weight:600;}
    .stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px;}
    .stat{background:#12121A;border:1px solid #252535;border-radius:14px;padding:14px;text-align:center;}
    .stat-value{font-size:22px;font-weight:800;color:#7C3AED;margin-bottom:2px;}
    .stat-label{font-size:10px;color:#55556A;text-transform:uppercase;letter-spacing:0.5px;}
    .section{margin:0 16px 16px;}
    .section-title{font-size:13px;font-weight:700;color:#8888AA;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;}
    .desc{background:#12121A;border:1px solid #252535;border-radius:14px;padding:16px;font-size:14px;line-height:1.7;color:#8888AA;}
    .lessons{background:#12121A;border:1px solid #252535;border-radius:14px;overflow:hidden;}
    .lesson{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #252535;cursor:pointer;transition:background 0.15s;}
    .lesson:last-child{border-bottom:none;}
    .lesson:active{background:#1A1A26;}
    .lesson-num{width:32px;height:32px;border-radius:10px;background:#1A1A26;border:1px solid #252535;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#8888AA;flex-shrink:0;}
    .lesson-num.done{background:#7C3AED;border-color:#8B5CF6;color:#fff;}
    .lesson-num.active{background:rgba(124,58,237,0.2);border-color:rgba(124,58,237,0.4);color:#7C3AED;}
    .lesson-info{flex:1;}
    .lesson-title{font-size:13px;font-weight:600;color:#F0F0FF;margin-bottom:2px;}
    .lesson-title.locked{color:#55556A;}
    .lesson-dur{font-size:11px;color:#55556A;}
    .lesson-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;}
    .free-badge{background:rgba(16,185,129,0.12);color:#10B981;border:1px solid rgba(16,185,129,0.25);}
    .lock-icon{font-size:13px;color:#55556A;}
    .progress-section{margin:16px;}
    .progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
    .progress-label{font-size:13px;font-weight:600;color:#F0F0FF;}
    .progress-pct{font-size:13px;font-weight:800;color:#7C3AED;}
    .progress-bar{height:6px;background:#252535;border-radius:3px;overflow:hidden;}
    .progress-fill{height:100%;background:linear-gradient(90deg,#7C3AED,#06B6D4);border-radius:3px;transition:width 0.5s ease;}
    .progress-sub{font-size:11px;color:#55556A;margin-top:6px;}
    .cta-area{margin:16px;margin-bottom:32px;}
    .cta-btn{width:100%;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;border:none;border-radius:14px;padding:16px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}
    .cta-btn:active{opacity:0.9;}
  </style>
</head>
<body>
  <div class="hero">
    <div class="badge" id="category">Loading...</div>
    <h1 id="title">Course Title</h1>
    <div class="instructor">
      <img id="instructorAvatar" src="https://api.dicebear.com/7.x/avataaars/png?seed=default" alt="Instructor"/>
      <div class="instructor-info">
        <div class="instructor-label">Instructor</div>
        <div class="instructor-name" id="instructorName">—</div>
      </div>
    </div>
  </div>

  <div class="enrolled-banner" id="enrolledBanner">
    <div class="enrolled-dot"></div>
    <div class="enrolled-text">You're enrolled — full access unlocked</div>
  </div>

  <div class="progress-section">
    <div class="progress-header">
      <span class="progress-label">Your Progress</span>
      <span class="progress-pct" id="progressPct">25%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width:25%"></div>
    </div>
    <div class="progress-sub" id="progressSub">2 of 8 lessons completed</div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value" id="rating">4.8</div>
      <div class="stat-label">⭐ Rating</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="price">Free</div>
      <div class="stat-label">💰 Price</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">About</div>
    <div class="desc" id="description">Loading course content...</div>
  </div>

  <div class="section">
    <div class="section-title">Curriculum</div>
    <div class="lessons" id="lessons"></div>
  </div>

  <div class="cta-area">
    <button class="cta-btn" onclick="handleCTA()">
      ▶ Continue Learning
    </button>
  </div>

  <script>
    var lessons=[
      {title:"Introduction & Course Overview",dur:"12 min",done:true,free:true},
      {title:"Setting Up Your Environment",dur:"18 min",done:true,free:true},
      {title:"Core Concepts Deep Dive",dur:"34 min",done:false,active:true,free:false},
      {title:"Hands-On Project Walkthrough",dur:"45 min",done:false,free:false},
      {title:"Advanced Patterns & Techniques",dur:"38 min",done:false,free:false},
      {title:"Testing & Best Practices",dur:"26 min",done:false,free:false},
      {title:"Deployment & Production",dur:"22 min",done:false,free:false},
      {title:"Final Project & Assessment",dur:"50 min",done:false,free:false},
    ];

    function renderLessons(){
      var el=document.getElementById('lessons');
      el.innerHTML='';
      lessons.forEach(function(l,i){
        var numClass=l.done?'lesson-num done':l.active?'lesson-num active':'lesson-num';
        var numContent=l.done?'✓':(i+1);
        var badge=l.free&&!l.done?'<span class="lesson-badge free-badge">Free</span>':(!l.done&&!l.active?'<span class="lock-icon">🔒</span>':'');
        el.innerHTML+='<div class="lesson" onclick="selectLesson('+i+')">'+
          '<div class="'+numClass+'">'+numContent+'</div>'+
          '<div class="lesson-info">'+
            '<div class="lesson-title'+((!l.done&&!l.active&&!l.free)?' locked':'')+'">'+l.title+'</div>'+
            '<div class="lesson-dur">'+l.dur+'</div>'+
          '</div>'+badge+
        '</div>';
      });
    }

    function selectLesson(i){
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'LESSON_SELECT',index:i,lesson:lessons[i]}));
      }
    }

    function handleCTA(){
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'CTA_PRESSED'}));
      }
    }

    window.receiveNativeData=function(jsonStr){
      try{
        var d=JSON.parse(jsonStr);
        if(d.title) document.getElementById('title').textContent=d.title;
        if(d.description) document.getElementById('description').textContent=d.description;
        if(d.category) document.getElementById('category').textContent=d.category.toUpperCase();
        if(d.rating) document.getElementById('rating').textContent=parseFloat(d.rating).toFixed(1);
        if(d.price) document.getElementById('price').textContent='$'+d.price;
        if(d.instructorName) document.getElementById('instructorName').textContent=d.instructorName;
        if(d.instructorAvatar) document.getElementById('instructorAvatar').src=d.instructorAvatar;
        if(d.isEnrolled) document.getElementById('enrolledBanner').classList.add('show');
      }catch(e){}
    };

    renderLessons();
  </script>
</body>
</html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {course?.title || "Course Content"}
          </Text>
          <Text style={styles.headerSub}>Course Overview</Text>
        </View>

        <TouchableOpacity onPress={handleReload} style={styles.headerBtn}>
          <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.loadBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            opacity: isLoading ? 1 : 0,
          },
        ]}
      />

      {/* Nav bar */}
      {navState && (
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => webViewRef.current?.goBack()}
            disabled={!navState.canGoBack}
            style={[styles.navBtn, !navState.canGoBack && { opacity: 0.3 }]}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => webViewRef.current?.goForward()}
            disabled={!navState.canGoForward}
            style={[styles.navBtn, !navState.canGoForward && { opacity: 0.3 }]}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
          <View style={styles.urlBar}>
            <Ionicons name="lock-closed" size={11} color={Colors.success} />
            <Text style={styles.urlText} numberOfLines={1}>
              {course?.title || "Course Content"}
            </Text>
          </View>
        </View>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingTitle}>Loading Course</Text>
            <Text style={styles.loadingSubtitle}>
              Preparing your content...
            </Text>
            <View style={styles.loadingProgressBar}>
              <Animated.View
                style={[
                  styles.loadingProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Error state */}
      {hasError ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Ionicons name="wifi-outline" size={36} color={Colors.error} />
            </View>
            <Text style={styles.errorTitle}>Content Unavailable</Text>
            <Text style={styles.errorSubtitle}>
              Failed to load course content.{"\n"}Please check your connection.
            </Text>
            <TouchableOpacity onPress={handleReload} style={styles.reloadBtn}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.reloadText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>← Back to Course</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onLoadProgress={handleLoadProgress}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavStateChange}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          style={styles.webview}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  headerSub: { color: Colors.textDim, fontSize: 11, marginTop: 1 },
  loadBar: {
    height: 2,
    backgroundColor: Colors.primary,
    position: "absolute",
    top: 62,
    left: 0,
    zIndex: 100,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  urlText: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    width: 260,
    gap: 12,
  },
  loadingTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  loadingProgressBar: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  loadingProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    width: "100%",
    gap: 12,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  errorSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  reloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginTop: 4,
  },
  reloadText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  backLink: { marginTop: 4 },
  backLinkText: { color: Colors.textMuted, fontSize: 13 },
  webview: { flex: 1, backgroundColor: Colors.bg },
});
