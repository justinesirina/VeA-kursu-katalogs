package lv.venta.coursecatalog.config;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
