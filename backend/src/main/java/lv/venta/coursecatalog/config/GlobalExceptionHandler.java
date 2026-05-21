package lv.venta.coursecatalog.config;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Globāls kļūdu apstrādātājs visiem REST kontrolieriem.
 * Nodrošina vienotu kļūdu atbilžu formātu validācijas un "nav atrasts" situācijās.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Apstrādā validācijas kļūdas (@Valid @RequestBody neizturēts validāciju).
     * Atgriež HTTP 400 ar lauku → kļūdas ziņojuma kartējumu.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Apstrādā situācijas, kad pieprasītais resurss nav atrasts.
     * Atgriež HTTP 404.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    /**
     * Apstrādā situācijas, kad URL ceļa parametrs nesakrīt ar gaidāmo tipu
     * (piem., maršruts /courses/{id:UUID}, bet lietotājs ievada nederīgu UUID).
     * Atgriež HTTP 400 ar skaidru ziņu, nevis 500 — tas ļauj frontend parādīt
     * "kurss nav atrasts" lapu, nevis vispārēju kļūdu.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("kļūda", "Nederīgs URL parametrs '" + ex.getName() + "'.");
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Apstrādā servisa līmenī mestas validācijas kļūdas (piem., neatbilstoša lietotāja loma
     * autora pievienošanai). Atgriež HTTP 400 ar ziņu.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("kļūda", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Apstrādā @PreAuthorize tiesību noraidījumus. Atgriež HTTP 403.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("kļūda", "Nav pietiekamu tiesību šai darbībai.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    /**
     * Rezerves apstrādātājs neparedzētām RuntimeException kļūdām.
     * Atgriež HTTP 500 ar kļūdas aprakstu.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("kļūda", ex.getMessage());
        return ResponseEntity.internalServerError().body(body);
    }
}
