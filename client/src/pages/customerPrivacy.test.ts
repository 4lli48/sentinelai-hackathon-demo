import { describe, expect, it } from "vitest";
import { customerPrivacyPolicy } from "./customerPrivacy";

describe("سياسة وخصوصية بيانات العميل — SentinelAI", () => {
  it("تحتوي على عنوان القسم ونصوص الخصوصية والشفافية المعتمدة مع خلو النصين من كلمة Gemini", () => {
    expect(customerPrivacyPolicy.sectionTitleAr).toBe("خصوصية بيانات العميل");
    expect(customerPrivacyPolicy.sectionTitleEn).toBe("Customer data privacy");
    expect(customerPrivacyPolicy.overviewAr).toBe("تُحفظ بيانات العملية وسجل مراجعتها ضمن بيئة المشروع المخصصة، وتُستخدم فقط لتحليل المخاطر والمراجعة والتدقيق المرتبط بالحالة. يفصل SentinelAI بين حفظ السجل ومسار التحليل المحلي لحماية خصوصية بيانات العميل.");
    expect(customerPrivacyPolicy.overviewAr).not.toContain("Gemini");
    expect(customerPrivacyPolicy.overviewEn).not.toContain("Gemini");
  });

  it("تتضمن النقاط الثلاث المحددة للاستخدام والتحليل المحلي وسجل المراجعة", () => {
    expect(customerPrivacyPolicy.points).toHaveLength(3);
    const [purpose, localProcessing, retention] = customerPrivacyPolicy.points;

    expect(purpose?.titleAr).toBe("استخدام محدد");
    expect(purpose?.textAr).toBe("بيانات العملية تستخدم للتقييم والتحقيق وسجل التدقيق فقط.");

    expect(localProcessing?.titleAr).toBe("تحليل محلي عند التفعيل");
    expect(localProcessing?.textAr).toBe("عند تفعيل Local AI يُعالج سياق التحليل داخل الجهاز، ليبقى ضمن بيئة SentinelAI المخصصة وبعيدًا عن أي مسار ذكاء خارجي غير لازم للعرض.");
    expect(localProcessing?.textAr).not.toContain("Gemini");
    expect(localProcessing?.textEn).not.toContain("Gemini");

    expect(retention?.titleAr).toBe("سجل للمراجعة");
    expect(retention?.textAr).toBe("تحفظ العملية لتمكين المراجع من الرجوع إلى القرار والعوامل المسجلة.");
  });

  it("تحتوي على بطاقة مرجعية رسمية لسدايا — حماية البيانات الشخصية مع الرابط الرسمي الصحيح", () => {
    const sdaia = customerPrivacyPolicy.sdaiaReference;
    expect(sdaia).toBeDefined();
    expect(sdaia.authority).toBe("SDAIA");
    expect(sdaia.authorityAr).toBe("سدايا");
    expect(sdaia.cardTitleAr).toBe("سدايا — حماية البيانات الشخصية");
    expect(sdaia.cardTitleEn).toBe("SDAIA — Personal Data Protection");
    expect(sdaia.url).toBe("https://sdaia.gov.sa/ar/Research/Pages/DataProtection.aspx");
  });

  it("توضح مبادئ تحديد الغرض وتقليل البيانات ومدة الاحتفاظ وإجراءات الحماية بالعربية والإنجليزية", () => {
    const sdaia = customerPrivacyPolicy.sdaiaReference;
    expect(sdaia.principles).toHaveLength(4);

    const principleIds = sdaia.principles.map(p => p.id);
    expect(principleIds).toContain("purpose-specification");
    expect(principleIds).toContain("data-minimization");
    expect(principleIds).toContain("retention-period");
    expect(principleIds).toContain("protection-measures");

    const allAr = sdaia.principles.map(p => `${p.titleAr} ${p.textAr}`).join(" ");
    expect(allAr).toContain("تحديد الغرض من استخدام البيانات");
    expect(allAr).toContain("تقليل البيانات إلى الحد اللازم");
    expect(allAr).toContain("مدة الاحتفاظ");
    expect(allAr).toContain("إجراءات الحماية التنظيمية والإدارية والتقنية");

    const allEn = sdaia.principles.map(p => `${p.titleEn} ${p.textEn}`).join(" ");
    expect(allEn.toLowerCase()).toContain("purpose specification");
    expect(allEn.toLowerCase()).toContain("data minimization");
    expect(allEn.toLowerCase()).toContain("retention period");
    expect(allEn.toLowerCase()).toContain("protection measures");
  });

  it("تعتمد صياغة إيجابية ومهنية تشرح دور وتركيز المرجع وخالية من العبارات السلبية والتحفظية", () => {
    const sdaia = customerPrivacyPolicy.sdaiaReference;
    expect(sdaia.alignmentTypeAr).toBe("تركيز المواءمة");
    expect(sdaia.alignmentTypeEn).toBe("Alignment focus");
    expect(sdaia.governanceRoleAr).toBe("مرجع حوكمة داعم");
    expect(sdaia.governanceRoleEn).toBe("Supporting governance reference");

    // Must be positive and not contain negative disclaimer phrasing
    expect(sdaia.boundaryAr).not.toContain("لا يمثل اعتمادًا رسميًا");
    expect(sdaia.boundaryAr).not.toContain("لا يزعم الامتثال القانوني الكامل");
    expect(sdaia.boundaryAr).not.toContain("لا يدّعي");
    expect(sdaia.boundaryAr).toContain("تطبيق مبادئ حماية البيانات");
    expect(sdaia.boundaryEn).toContain("Applying data protection principles");
  });

  it("تحتوي على جملة التذكير الهادئة الخاصة بمساحة العمليات", () => {
    expect(customerPrivacyPolicy.operationsWorkspaceNoteAr).toBe("بيانات هذه العملية خاصة ومحفوظة للمراجعة داخل SentinelAI.");
    expect(customerPrivacyPolicy.operationsWorkspaceNoteEn).toBe("This operation’s data is private and retained within SentinelAI for review.");
  });
});
